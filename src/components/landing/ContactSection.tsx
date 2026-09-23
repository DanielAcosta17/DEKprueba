import React, { useState } from 'react';
import {
  MessageCircle,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurante / Cafetería');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct WhatsApp message
    const msg = `Hola *D. E. K NovaCore*, quiero solicitar información para digitalizar mi negocio:\n\n` +
      `▪ *Nombre:* ${name.trim() || 'No especificado'}\n` +
      `▪ *Negocio:* ${businessName.trim() || 'No especificado'}\n` +
      `▪ *Tipo:* ${businessType}\n` +
      `▪ *Teléfono:* ${phone.trim() || 'No especificado'}\n` +
      (message.trim() ? `▪ *Mensaje:* ${message.trim()}\n\n` : '\n') +
      `_Enviado desde el formulario web de deknovacore.com_`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/50760244779?text=${encoded}`, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <section id="contacto" className="py-16 lg:py-24 bg-[#111a24] border-t border-slate-700/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left information */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                Hablemos de tu Proyecto
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                ¿Listo para lanzar el catálogo o menú de tu negocio?
              </h2>
            </div>

            <p className="text-sm text-sky-200 leading-relaxed">
              Escríbenos directamente o completa el formulario. Te responderemos en minutos para asesorarte en la mejor plantilla y configuración para tu marca.
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <a
                href="https://wa.me/50760244779?text=Hola%20D.%20E.%20K%20NovaCore,%20quiero%20m%C3%A1s%20informaci%C3%B3n"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/80 flex items-center gap-3.5 text-emerald-200 hover:scale-[1.01] transition-transform shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">WhatsApp Directo</div>
                  <div className="text-[11px] text-emerald-300">+507 6024-4779 (Atención Rápida)</div>
                </div>
              </a>

              <a
                href="mailto:danielacostaperez17@gmail.com"
                className="p-3.5 rounded-2xl bg-[#16222f] dark:bg-[#111a24] border border-slate-700/80 flex items-center gap-3.5 hover:border-sky-400 transition-colors shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-800/60 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white">Correo Electrónico de Contacto</div>
                  <div className="text-[11px] text-sky-300 font-medium">danielacostaperez17@gmail.com</div>
                </div>
              </a>

              <div className="p-3.5 rounded-2xl bg-[#16222f] dark:bg-[#111a24] border border-slate-700/80 flex items-center gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-800/60 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white">Horario de Soporte</div>
                  <div className="text-[11px] text-sky-300 font-medium">Lunes a Sábado: 8:00 AM - 7:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#16222f] dark:bg-[#111a24] p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl shadow-slate-950/30">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">
                  Solicita tu Sitio o Catálogo
                </h3>
                <p className="text-xs sm:text-[13px] text-sky-300 font-medium mt-0.5">
                  Completa tus datos y te enviaremos una propuesta inmediata por WhatsApp.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-emerald-950/50 rounded-2xl border border-emerald-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-900 text-emerald-300 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-base">
                    ¡Mensaje Abierto en WhatsApp!
                  </h4>
                  <p className="text-xs text-sky-100 max-w-sm mx-auto">
                    Tu solicitud ha sido formateada. Presiona enviar en WhatsApp y nuestro equipo te responderá enseguida.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-emerald-400 font-bold hover:underline pt-2 cursor-pointer"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-sky-200 mb-1">
                        Tu Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Carlos Santana"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0f1722] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-sky-200 mb-1">
                        Nombre de tu Negocio *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Panadería El Sol"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0f1722] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-sky-200 mb-1">
                        Tipo de Negocio *
                      </label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0f1722] text-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      >
                        <option value="Restaurante / Cafetería">Restaurante / Cafetería</option>
                        <option value="Pastelería / Repostería">Pastelería / Repostería</option>
                        <option value="Tienda de Ropa / Moda">Tienda de Ropa / Moda</option>
                        <option value="Ferretería / Materiales">Ferretería / Materiales</option>
                        <option value="Barbería / Salón de Belleza">Barbería / Salón de Belleza</option>
                        <option value="Supermercado / Mini Market">Supermercado / Mini Market</option>
                        <option value="Tienda de Accesorios / Regalos">Tienda de Accesorios / Regalos</option>
                        <option value="Tecnología / Accesorios">Tecnología / Accesorios</option>
                        <option value="Otro Emprendimiento">Otro Emprendimiento</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-sky-200 mb-1">
                        Tu Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+507 6000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0f1722] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-sky-200 mb-1">
                      ¿Qué necesitas? (Opcional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Cuéntanos sobre tus productos o servicios, cuántos productos tienes, si necesitas código QR para mesas, etc."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0f1722] text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all shine-effect"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Enviar Solicitud por WhatsApp</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
