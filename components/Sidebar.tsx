import Link from "next/link"

const Sidebar = () => {
  return (
    <div className="bg-white text-white p-5">
        <ul className="gap-5 flex lg:flex-col">
            <li className="flex-1">
                <Link href='/create-chatbots' className="hover:opacity-50 flex flex-col text-center lg:text-left lg:flex-row items-center gap-2 p-5 rounded-md bg-[#2991EE]">Link</Link>
            </li>
            <li className="flex-1">
                <Link href='/view-chatbots'>Link</Link>
            </li>
            <li className="flex-1">
                <Link href='/review-sessions'>Link</Link>
            </li>
        </ul>
    </div>
  )
}

export default Sidebar