const DevicePhoneMobileIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
)

const CogIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)

export function AdditionalServices() {
  const services = [
    { icon: <DevicePhoneMobileIcon />, title: 'Transferencia de datos', desc: 'Pasamos todos tus datos, fotos y apps de tu iPhone anterior al nuevo' },
    { icon: <CogIcon />, title: 'Configuración inicial', desc: 'Dejamos tu iPhone listo para usar con tu cuenta y preferencias' },
    { icon: <ShieldIcon />, title: 'Protector de pantalla', desc: 'Instalación de vidrio templado de alta calidad incluida' },
  ]

  return (
    <section className="border-t border-line bg-bg py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-fg text-center mb-2">
          Servicios adicionales
        </h2>
        <p className="text-fg-muted text-sm text-center mb-10">
          Disponibles al momento del retiro en el local
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {services.map((item, i) => (
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
