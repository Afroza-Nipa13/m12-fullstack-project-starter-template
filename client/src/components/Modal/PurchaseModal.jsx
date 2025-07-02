import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import useAuth from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../Form/CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK_KEY);
const PurchaseModal = ({ closeModal, isOpen, plant,fetchPlant}) => {
  const { user } = useAuth()
  console.log(user)
  const { quantity, seller, name, _id, image, price, category } = plant || {};
  const [totalPrice, setTotalPrice] = useState(price)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [orderedData, setOrderedData] = useState({
    customer: {
      name: user?.displayName,
      email: user?.email,
      image: user?.photoURL
    },
    seller,
    plantId: _id,
    plantName: name,
    plantImage: image,
    plantCategory: category,
    quantity: 1
  })

  useEffect(() => {
    if (user) {
      setOrderedData(prev => {
        return {
          ...prev,
          customer: {
            name: user?.displayName,
            email: user?.email,
            image: user?.photoURL
          }
        }
      })
    }
  }, [user])
  // Total Price Calculation

  const handleQuantityPrice = (value) => {
    const totalQuantity = parseInt(value)
    if (totalQuantity > quantity)
      return toast.error('You cannot purchase more then our limited quantity..')
    const calculatedPrice = totalQuantity * price;
    setSelectedQuantity(totalQuantity)
    setTotalPrice(calculatedPrice)
    setOrderedData(prev=>{
      return {...prev,price: calculatedPrice,
        quantity: totalQuantity,}
    })

    console.log(orderedData)
  }


  return (
    <Dialog
      open={isOpen}
      as='div'
      className='relative z-10 focus:outline-none '
      onClose={closeModal}
    >
      <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
        <div className='flex min-h-full items-center justify-center p-4'>
          <DialogPanel
            transition
            className='w-full max-w-md bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 shadow-xl rounded-2xl'
          >
            <DialogTitle
              as='h3'
              className='text-lg font-medium text-center leading-6 text-gray-900'
            >
              Review Info Before Purchase
            </DialogTitle>
            <div className='mt-2'>
              <p className='text-sm text-gray-500'>Plant: {name}</p>
            </div>
            <div className='mt-2'>
              <p className='text-sm text-gray-500'>Category: {category}</p>
            </div>
            <div className='mt-2'>
              <p className='text-sm text-gray-500'>Customer: {user?.displayName}</p>
            </div>

            <div className='mt-2'>
              <p className='text-sm text-gray-500'>Price: Per Unit $ {price}</p>
            </div>
            <div className='mt-2'>
              <p className='text-sm text-gray-500'>Available Quantity: {quantity}</p>
            </div>
            <hr className='mt-2' />
            <p>Order Info :</p>

            <div className='mt-2'>
              <input
                onChange={(e) => handleQuantityPrice(e.target.value)}
                value={selectedQuantity}
                type='number'
                min={1}

                className='border px-3 py-1' />
            </div>
            <div className='mt-2'>
              <p className='text-sm text-gray-500'>Selected Quantity : {selectedQuantity}</p>
            </div>

            <div className='mt-2'>
              <p className='text-sm text-gray-500'>Total Price: {totalPrice}</p>

              {/* stipe checkOut form */}

              <Elements stripe={stripePromise}>
                <CheckoutForm 
              closeModal={closeModal}
              totalPrice={totalPrice}
              orderedData={orderedData}
              fetchPlant={fetchPlant}/>
              </Elements>
            </div>

          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default PurchaseModal
