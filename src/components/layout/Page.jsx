import { useOutletContext } from 'react-router-dom'
import Topbar from './Topbar'

export default function Page({ title, subtitle, actions, children }) {
  const { openSidebar } = useOutletContext()
  return (
    <>
      <Topbar title={title} subtitle={subtitle} onMenuClick={openSidebar} actions={actions} />
      <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">{children}</main>
    </>
  )
}
