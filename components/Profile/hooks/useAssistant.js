import { useState, useEffect } from 'react';

export const securityQuestions = [
  'İlk evcil hayvanınızın adı neydi?',
  'Doğduğunuz şehir neresidir?',
  'En sevdiğiniz yemek nedir?',
  'İlk öğretmeninizin adı neydi?',
  'Çocukken en sevdiğiniz oyun neydi?',
];

export function useAssistant() {
  const [assistantForm, setAssistantForm] = useState({
    username: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState('');
  const [assistantSuccess, setAssistantSuccess] = useState('');

  useEffect(() => {
    try {
      const assistantData = JSON.parse(
        localStorage.getItem('assistant_credentials') || '{}'
      );
      if (assistantData.username) {
        setAssistantForm(prev => ({
          ...prev,
          username: assistantData.username,
          securityQuestion: assistantData.securityQuestion || '',
        }));
      }
    } catch (err) {
      console.error('Assistant data load error:', err);
    }
  }, []);

  const handleSaveAssistant = async () => {
    setAssistantLoading(true);
    setAssistantError('');
    setAssistantSuccess('');

    if (!assistantForm.username.trim()) {
      setAssistantError('Kullanıcı adı gerekli');
      setAssistantLoading(false);
      return;
    }

    if (!assistantForm.securityQuestion) {
      setAssistantError('Güvenlik sorusu seçiniz');
      setAssistantLoading(false);
      return;
    }

    if (!assistantForm.securityAnswer.trim()) {
      setAssistantError('Güvenlik cevabı gerekli');
      setAssistantLoading(false);
      return;
    }

    try {
      // localStorage'a kaydet
      localStorage.setItem(
        'assistant_credentials',
        JSON.stringify({
          username: assistantForm.username,
          securityQuestion: assistantForm.securityQuestion,
          securityAnswer: assistantForm.securityAnswer,
        })
      );

      setAssistantSuccess('Asistan ayarları başarıyla kaydedildi!');
      setTimeout(() => setAssistantSuccess(''), 3000);
    } catch (err) {
      console.error('Assistant save error:', err);
      setAssistantError('Kaydetme hatası oluştu');
    } finally {
      setAssistantLoading(false);
    }
  };

  return {
    assistantForm,
    setAssistantForm,
    assistantLoading,
    assistantError,
    assistantSuccess,
    handleSaveAssistant,
  };
}
