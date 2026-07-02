export default function MobileFrame({ children }) {
  return (
    <div className="min-h-screen flex items-start justify-center bg-[#E9E4D6] font-body">
      <div className="phone-frame">
        <div className="notch" />
        <div className="scroll-area">{children}</div>
      </div>
    </div>
  )
}
