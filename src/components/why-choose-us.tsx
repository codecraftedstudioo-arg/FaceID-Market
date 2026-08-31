import { locationCityLine } from '@/config/site'

const ShieldCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)

const BuildingStorefrontIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
  </svg>
)

const TagIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
)

const ChatIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
)

export function WhyChooseUs() {
  const features = [
    { icon: <ShieldCheckIcon />, title: 'Equipos sellados', desc: 'Garantía oficial Apple' },
    { icon: <TagIcon />, title: 'Mejor precio', desc: 'Precios competitivos en USD' },
    { icon: <BuildingStorefrontIcon />, title: 'Confianza y seguridad', desc: `Local físico en ${locationCityLine()}` },
    { icon: <ChatIcon />, title: 'Atención directa', desc: 'Respuesta por WhatsApp al instante' },
  ]

  return (
    <section id="por-que-elegirnos" className="border-t border-line bg-bg-subtle py-16 sm:py-20 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-fg text-center mb-10">
          ¿Por qué elegirnos?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {features.map((item, i) => (
            <div key={i} className="text-center group">
              <div className="w-12 h-12 rounded-full bg-fg/5 border-2 border-[#4A6BDB]/40 dark:border-[#263A99]/60 flex items-center justify-center mx-auto mb-3 group-hover:border-[#4A6BDB] dark:group-hover:border-[#263A99] group-hover:scale-110 transition-all duration-300">
                <div className="text-[#4A6BDB]">{item.icon}</div>
              </div>
              <h3 className="text-fg font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-fg-muted text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
