import EmailPreview from './EmailPreview';

export default function OnboardingEmailPreview({ visible, onClose }) {
  return <EmailPreview visible={visible} onClose={onClose} kind="welcome" />;
}
