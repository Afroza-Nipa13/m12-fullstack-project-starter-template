
import AddPlantForm from '../../../components/Form/AddPlantForm'
import { imageUpload } from '../../../Api/utils';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../../../hooks/useAuth';

const AddPlant = () => {
  const { user } = useAuth()
  const [isUploading, setIsUpLoading] = useState(false)
  const [uploadImg, setUploadImg] = useState(null)
  const [uploadImgError, setUploadImgError] = useState(false)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUpLoading(true)
    const form = e.target;
    const name = form.name.value
    const category = form.category.value
    const description = form.description.value
    const price = form.price.value
    const quantity = form.quantity.value

    try {

      const plantsInfo = {
        name,
        category,
        description,
        price,
        quantity,
        image: uploadImg,
        seller: {
          name: user?.displayName,
          email: user?.email,
          image: user?.photoURL
        }
      }
      console.table(plantsInfo)

      // save to the db
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/add-plants`, plantsInfo)

      toast.success('Plant data added successfully... Yee!')
      form.reset()
      console.log(data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsUpLoading(false)
    }
  }

  const handleUploadImage = async (e) => {
    e.preventDefault()
    const image = e.target.files[0];
    try {
      const imgURL = await imageUpload(image)
      setUploadImg(imgURL)
    }catch(err){
      setUploadImgError("Image Upload failed")
      console.log(err)
    }
  }
  return (
    <div>
      {/* Form */}
      <AddPlantForm
        isUploading={isUploading}
        uploadImg={uploadImg}
        handleUploadImage={handleUploadImage}
        handleFormSubmit={handleFormSubmit}
        uploadImgError={uploadImgError} />
    </div>
  )
}

export default AddPlant
