import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { ContactForm } from './contact-form'

const baseIphoneInfo = {
  modelo: 'iPhone 17 Pro',
  almacenamiento: '256 GB',
  color: 'Orange',
  precioUSD: 1500,
  priceText: '1.500',
}

describe('<ContactForm />', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renderiza inputs de nombre, teléfono y botones', () => {
    render(<ContactForm iphoneInfo={baseIphoneInfo} onCancel={() => {}} onSubmitted={() => {}} />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /coordinar la entrega/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('elimina números mientras el usuario tipea en el nombre', () => {
    render(<ContactForm iphoneInfo={baseIphoneInfo} onCancel={() => {}} onSubmitted={() => {}} />)
    const input = screen.getByLabelText(/nombre/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Juan123' } })
    expect(input.value).toBe('Juan')
  })

  it('elimina letras mientras el usuario tipea en el teléfono', () => {
    render(<ContactForm iphoneInfo={baseIphoneInfo} onCancel={() => {}} onSubmitted={() => {}} />)
    const input = screen.getByLabelText(/whatsapp/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'abc1144556677' } })
    expect(input.value).toBe('1144556677')
  })

  it('muestra error si el nombre es muy corto al hacer submit', async () => {
    render(<ContactForm iphoneInfo={baseIphoneInfo} onCancel={() => {}} onSubmitted={() => {}} />)
    const submit = screen.getByRole('button', { name: /coordinar la entrega/i })
    fireEvent.click(submit)
    expect(await screen.findByText(/ingresá tu nombre/i)).toBeInTheDocument()
  })

  it('muestra error si el teléfono es inválido al hacer submit', async () => {
    render(<ContactForm iphoneInfo={baseIphoneInfo} onCancel={() => {}} onSubmitted={() => {}} />)
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText(/whatsapp/i), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /coordinar la entrega/i }))
    expect(await screen.findByText(/teléfono inválido/i)).toBeInTheDocument()
  })

  it('limpia el error de nombre apenas el usuario tipea', async () => {
    render(<ContactForm iphoneInfo={baseIphoneInfo} onCancel={() => {}} onSubmitted={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /coordinar la entrega/i }))
    expect(await screen.findByText(/ingresá tu nombre/i)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'J' } })
    await waitFor(() => {
      expect(screen.queryByText(/ingresá tu nombre/i)).not.toBeInTheDocument()
    })
  })

  it('limpia el error de teléfono apenas el usuario tipea', async () => {
    render(<ContactForm iphoneInfo={baseIphoneInfo} onCancel={() => {}} onSubmitted={() => {}} />)
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText(/whatsapp/i), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /coordinar la entrega/i }))
    expect(await screen.findByText(/teléfono inválido/i)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/whatsapp/i), { target: { value: '1144556677' } })
    await waitFor(() => {
      expect(screen.queryByText(/teléfono inválido/i)).not.toBeInTheDocument()
    })
  })

  it('llama a onCancel cuando se clickea Cancelar', () => {
    const onCancel = vi.fn()
    render(<ContactForm iphoneInfo={baseIphoneInfo} onCancel={onCancel} onSubmitted={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('si cambian color/storage antes de submit, el mensaje refleja la última selección', async () => {
    const onSubmitted = vi.fn()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const { rerender } = render(
      <ContactForm
        iphoneInfo={baseIphoneInfo}
        onCancel={() => {}}
        onSubmitted={onSubmitted}
      />
    )
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText(/whatsapp/i), { target: { value: '1144556677' } })

    // El usuario cambió color/storage/precio en el modal padre
    rerender(
      <ContactForm
        iphoneInfo={{
          modelo: 'iPhone 17 Pro',
          almacenamiento: '512 GB',
          color: 'Blue',
          precioUSD: 1750,
          priceText: '1.750',
        }}
        onCancel={() => {}}
        onSubmitted={onSubmitted}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /coordinar la entrega/i }))

    await waitFor(() => {
      expect(onSubmitted).toHaveBeenCalledTimes(1)
    })

    const [url] = openSpy.mock.calls[0]
    const decoded = decodeURIComponent(String(url))
    expect(decoded).toContain('512 GB')
    expect(decoded).toContain('Azul')
    expect(decoded).toContain('USD 1.750')
    // Y NO el original
    expect(decoded).not.toContain('256 GB')
    expect(decoded).not.toContain('Naranja')
    expect(decoded).not.toContain('1.500')
  })

  describe('mode="waitlist" (sin stock)', () => {
    it('cambia el texto del submit a "Avisame cuando esté disponible"', () => {
      render(
        <ContactForm
          iphoneInfo={baseIphoneInfo}
          mode="waitlist"
          onCancel={() => {}}
          onSubmitted={() => {}}
        />
      )
      expect(screen.getByRole('button', { name: /avisame cuando esté disponible/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /coordinar la entrega/i })).not.toBeInTheDocument()
    })

    it('en submit válido marca sin_stock=true en el lead y abre WhatsApp con copy de waitlist', async () => {
      const onSubmitted = vi.fn()
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      render(
        <ContactForm
          iphoneInfo={baseIphoneInfo}
          mode="waitlist"
          onCancel={() => {}}
          onSubmitted={onSubmitted}
        />
      )
      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan' } })
      fireEvent.change(screen.getByLabelText(/whatsapp/i), { target: { value: '1144556677' } })
      fireEvent.click(screen.getByRole('button', { name: /avisame cuando esté disponible/i }))

      await waitFor(() => {
        expect(onSubmitted).toHaveBeenCalledTimes(1)
      })

      // Verifica payload del CRM (logueado en localhost)
      const crmCall = consoleSpy.mock.calls.find(c => String(c[0]).includes('CRM webhook'))
      expect(crmCall).toBeTruthy()
      const payload = crmCall![1] as Record<string, unknown>
      expect(payload.sin_stock).toBe(true)

      // Verifica WhatsApp message
      const [url] = openSpy.mock.calls[0]
      const decoded = decodeURIComponent(String(url))
      expect(decoded).toContain('avisen cuando entre stock')
      expect(decoded).not.toContain('USD')
    })
  })

  it('en submit válido manda al CRM, abre WhatsApp y llama onSubmitted', async () => {
    const onSubmitted = vi.fn()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<ContactForm iphoneInfo={baseIphoneInfo} onCancel={() => {}} onSubmitted={onSubmitted} />)
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan Pérez' } })
    fireEvent.change(screen.getByLabelText(/whatsapp/i), { target: { value: '1144556677' } })
    fireEvent.click(screen.getByRole('button', { name: /coordinar la entrega/i }))

    await waitFor(() => {
      expect(onSubmitted).toHaveBeenCalledTimes(1)
    })

    expect(openSpy).toHaveBeenCalledTimes(1)
    const [url] = openSpy.mock.calls[0]
    expect(String(url)).toMatch(/^https:\/\/wa\.me\//)
    const decoded = decodeURIComponent(String(url))
    expect(decoded).toContain('Juan Pérez')
    expect(decoded).toContain('1144556677')
    expect(decoded).toContain('iPhone 17 Pro')
    expect(decoded).toContain('256 GB')
    expect(decoded).toContain('Naranja')
    expect(decoded).toContain('USD 1.500')
  })
})
