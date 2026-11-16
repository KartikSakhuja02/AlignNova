import EmailPreview from './EmailPreview';

export default function PartnerEmailPreview({ visible, onClose }) {
  return <EmailPreview visible={visible} onClose={onClose} kind="partner" />;
}
