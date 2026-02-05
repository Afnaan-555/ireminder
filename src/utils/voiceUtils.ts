class VoiceService {
  private synthesis: SpeechSynthesis;
  private isEnabled: boolean = true;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }) {
    if (!this.isEnabled || !this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice options
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 0.8;

    // Try to use a pleasant voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.synthesis.speak(utterance);
  }

  speakReminder(title: string, message?: string) {
    const text = message 
      ? `Reminder: ${title}. ${message}`
      : `Reminder: ${title}`;
    
    this.speak(text, { rate: 0.9, pitch: 1.1 });
  }

  speakTaskComplete(taskTitle: string) {
    this.speak(`Great job! You completed: ${taskTitle}`, { 
      rate: 1.1, 
      pitch: 1.2 
    });
  }

  speakWelcome() {
    const hour = new Date().getHours();
    let greeting = 'Hello';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    this.speak(`${greeting}! Welcome to iReminder. How can I help you stay productive today?`);
  }

  speakBreakReminder() {
    const messages = [
      "Time for a break! Step away from your work and recharge.",
      "Break time! Your mind and body will thank you for taking a moment to rest.",
      "It's time to pause and take a well-deserved break.",
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    this.speak(randomMessage, { rate: 0.9 });
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const voiceService = new VoiceService();