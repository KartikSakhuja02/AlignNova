import EmailPreview from './EmailPreview';

export default function OpportunityEmailPreview({ visible, onClose }) {
  return <EmailPreview visible={visible} onClose={onClose} kind="opportunity" />;
}
