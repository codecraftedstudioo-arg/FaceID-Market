import { useState } from 'react'
import { locationCityLine } from '@/config/site'

const faqs = [
  {
    q: '¿Los equipos son sellados y nuevos?',
    a: 'Sí, todos nuestros iPhones son equipos nuevos, sellados de fábrica, con garantía oficial de Apple.',
  },
  {
    q: '¿Dónde retiro mi compra?',
    a: `Retirás tu iPhone en nuestro local de ${locationCityLine()}. Coordinamos día y horario por WhatsApp.`,
  },
  {
    q: '¿Qué formas de pago aceptan?',
    a: 'Aceptamos dólares en efectivo y pesos argentinos al tipo de cambio blue del día. Coordinamos el monto exacto al momento de la compra.',
  },
  {
    q: '¿Los precios están en dólares?',
    a: 'Sí, todos los precios están expresados en dólares estadounidenses (USD). Si querés pagar en pesos, te cotizamos al momento de la compra.',
  },
  {
    q: '¿Qué garantía tienen los equipos?',
    a: 'Todos nuestros iPhones cuentan con 12 meses de garantía oficial de Apple a nivel internacional. Entregamos el equipo con su serial number verificado y libre de iCloud.',
  },
  {
    q: '¿Cómo hago para comprar?',
    a: 'Tocá el precio del modelo que te interesa y se abre WhatsApp con tu consulta. Te respondemos al instante para coordinar el pago y retiro en el local.',
  },
  {
    q: '¿Puedo dar mi iPhone como parte de pago?',
    a: 'Sí, aceptamos tu iPhone usado como parte de pago. Cotizalo en segundos con nuestro cotizador online y conocé el valor de tu equipo al instante.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
      >
        <span className="text-sm sm:text-base text-fg font-medium pr-4 group-hover:text-[#4A6BDB] dark:group-hover:text-[#6B8AED] transition-colors">{q}</span>
        <svg
          className={`w-5 h-5 text-fg-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-60 pb-4' : 'max-h-0'}`}
      >
        <p className="text-fg-muted text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export function Faq() {
  return (
    <section id="preguntas-frecuentes" className="border-t border-line bg-bg py-16 sm:py-20 scroll-mt-20">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-fg text-center mb-10">
          Preguntas frecuentes
        </h2>
        <div>
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
