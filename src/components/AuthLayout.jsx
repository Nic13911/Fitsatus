export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#E9E4D6] font-body px-4 py-10">
      <div className="w-full max-w-md bg-paper rounded-2xl shadow-xl shadow-ink/10 border border-line overflow-hidden">
        {children}
      </div>
    </div>
  )
}
