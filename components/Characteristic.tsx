import { ChatbotCharacteristic } from '@/types/types'
import { OctagonX } from 'lucide-react'
import React from 'react'

const Characteristic = ({characteristic}:{characteristic: ChatbotCharacteristic}) => {
  return (
    <li className='relative p-10 bg-white border rounded-md'>
        {characteristic.content}
        <OctagonX className='w-6 h-6 text-white fill-red-500 absolute top-1 right-1 cursor-pointer hover:opacity-50'/>
    </li>
  )
}

export default Characteristic