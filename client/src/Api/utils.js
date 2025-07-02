// upload image and return image url

import axios from "axios"

export const imageUpload = async imageData => {
    const imgFromData = new FormData()
    imgFromData.append('image', imageData)

    const { data } = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
      imgFromData
    )

    return data?.data?.display_url;
}

// save or update user in database
export const saveUserInDataBase = async (user)=>{
  const {data}= await axios.post(
    `${import.meta.env.VITE_API_URL}/user`,
     user
  )
console.log(data)
}