import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useEffect, useState } from 'react';
import './checkoutForm.css'
import { FadeLoader } from 'react-spinners'
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const CheckoutForm = ({ totalPrice, closeModal, orderedData,fetchPlant }) => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure()
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false)
    const [carderror, setCarderror] = useState(null)
    const [clientSecret, setClientSecret] = useState('')
    console.log(clientSecret)
    useEffect(() => {
        const getClientSecret = async () => {
            const { data } = await axiosSecure.post('/create-payment-intent', {
                quantity: orderedData?.quantity,
                plantId: orderedData?.plantId
            })
            setClientSecret(data?.ClientSecret)
        }
        getClientSecret()
    }, [axiosSecure, orderedData])
    const handleSubmit = async (event) => {
        setProcessing(true)
        // Block native form submission.
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }
        const card = elements.getElement(CardElement);

        if (card == null) {
            return;
        }

        // Use your card Element with other Stripe.js APIs
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card,
        });

        if (error) {
            console.log('[error]', error);
            setCarderror(error.message)
            setProcessing(false)
            return
        } else {
            console.log('[PaymentMethod]', paymentMethod);
            setCarderror(null)
        }

        // akhon taka kata hobe

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card,
                billing_details: {
                    name: user?.displayName,
                    email: user?.email
                }
            }
        })
        if (result?.error) {
            setCarderror(result?.error?.message)
            return
        }
        if (result?.paymentIntent?.status === 'succeeded') {
            // set ordered data in database
            orderedData.transactionId = result?.paymentIntent?.id
            try {
                const { data } =await axiosSecure.post('/order', orderedData)
                console.log(data)
                if(data?.insertedId){
                    toast.success( 'Order placed successfully')
                }
                const {data :result}= await axiosSecure.patch(
                    `/quantity-update/${orderedData?.plantId}`,
                    {quantityToUpdate : orderedData?.quantity, 
                    status: 'decrease' }
                )
                fetchPlant()
                console.log(result)
            }catch(err){
                console.log(err)
                toast.error('something is wrong, try again')
            }finally{
                setProcessing(false)
                setCarderror(null)
                closeModal()
            }
    // update product quantity in db from plant collection
}
        console.log("result of payment", result)
    };
    return (
        <form onSubmit={handleSubmit}>
            <CardElement
                options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }}
            />
            {carderror && <p className='text-red-600 font-semibold mb-6'>{carderror}</p>}
            <div className='flex justify-between'>
                <button
                    className='px-3 py-1 bg-lime-400 text-black rounded-lg'
                    type="submit"
                    disabled={!stripe || processing}>

                    {processing ? <FadeLoader className='mt-2 inline-block justify-center text-center' /> : `Pay ${totalPrice}$`}
                </button>
                <button
                    className='px-3 py-1 bg-red-400 text-black  cursor-pointer rounded-lg'
                    type="submit"
                    onClick={closeModal}
                >

                    Cancel
                </button>
            </div>
        </form>
    );
};

export default CheckoutForm;
