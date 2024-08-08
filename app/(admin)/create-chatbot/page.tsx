'use client'
import { CREATE_CHATBOT } from '@/app/api/graphql/mutations/mutations'
import Avatar from '@/components/Avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useState } from 'react'
//import {useUser} from "@clerk/nextjs"
const CreateChatbot = () => {
//const {user}=useUser()
  const [name,setName]=useState("")
  const router=useRouter()
  const [createChatbot, {data,loading,error}]=useMutation(CREATE_CHATBOT,{
    variables:{
      clerk_user_id:'1', //user?.id
      name:name,
      created_at: new Date().toISOString() 
    }
  })

  const handleSubmit=async (e: FormEvent)=>{
    e.preventDefault()
    try{
     const data= await createChatbot()
    setName("")
    router.push(`/admin/chatbot/${data.data.insertChatbots.id}`)}
    catch(error){
      console.log(error)
    }
  }
  return (
    <div className='flex flex-col items-center justify-center md:flex-row md:space-x-10 bg-white p-10 rounded-md m-10'>
      <Avatar seed='create-chatbot'/>
      <div>
        <h1 className='text-xl lg:text-3xl font-semibold'>Create</h1>
        <h2 className='font-light'>Create a new chatbot to assist you in your conversations with customers</h2>
        <form className='flex flex-col md:flex-row gap-2 mt-5 ' onSubmit={handleSubmit}>
          <Input 
          type='text'
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder='Chatbot Name...'
          className='max-w-lg'
          required/>
          <Button disabled={loading || !name} type='submit'>
            {loading ? 'Creating chatbot...' : 'Create chatbot'}
          </Button>
        </form>
        <p className='text-gray-300 mt-5'>Example: Customer Support Chatbot</p>
      </div>

    </div>
  )
}

export default CreateChatbot