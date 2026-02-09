// components/ContactForm.tsx
import React, { useState, type FormEvent } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Hier können Sie Ihre eigene API-Route oder E-Mail-Service integrieren
      // Beispiel mit fetch:
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Fehler beim Senden:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          value={formData.name}
          onChange={handleChange}
          required 
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">E-Mail</label>
        <input 
          type="email" 
          id="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          required 
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="subject">Betreff</label>
        <input 
          type="text" 
          id="subject" 
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required 
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Nachricht</label>
        <textarea 
          id="message" 
          name="message" 
          rows={6}
          value={formData.message}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      {submitStatus === 'success' && (
        <div className="form-message success">
          Vielen Dank für Ihre Nachricht! Wir werden uns bald bei Ihnen melden.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="form-message error">
          Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es erneut.
        </div>
      )}

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
      </button>
    </form>
  );
}