import { locationCityLine } from '@/config/site'

export function HowItWorks() {
  const steps = [
    { step: '1', title: 'Elegí tu iPhone', desc: 'Mirá los precios en tiempo real de todos los modelos disponibles' },
    { step: '2', title: 'Consultá el precio', desc: 'Se abre WhatsApp con el modelo ya seleccionado para consultarnos' },
    { step: '3', title: 'Pago seguro', desc: 'Efectivo en dólares o pesos al tipo de cambio del día' },
    { step: '4', title: 'Retiro en el local', desc: `Retirá tu iPhone en nuestro local de ${locationCityLine()}` },
  ]

  return (
    <section id="como-funciona" className="border-t border-line bg-bg py-16 sm:py-20 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-fg text-center mb-10">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, i) => (
            <div key={i} className="text-center group">
              <div className="w-12 h-12 rounded-full bg-fg/5 border-2 border-[#4A6BDB]/40 dark:border-[#263A99]/60 flex items-center justify-center mx-auto mb-3 group-hover:border-[#4A6BDB] dark:group-hover:border-[#263A99] group-hover:scale-110 transition-all duration-300">
                <span className="text-xl font-bold text-[#4A6BDB]">{item.step}</span>
              </div>
              <h3 className="text-fg font-semibold mb-1">{item.title}</h3>
              <p className="text-fg-muted text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-fg-muted text-sm mt-8">
          Simple, directo, sin vueltas.
        </p>
      </div>
    </section>
  )
}
