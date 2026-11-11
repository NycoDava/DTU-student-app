import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import SubHeader from '../components/SubHeader';
import { initials, useCurrentUser } from '../data/currentUser';
import '../components/SubScreen.css';
import './Profile.css';

/**
 * "Edit My User Profile". PROTOTYPE: everything stays in local state, nothing is sent anywhere.
 * Fields start empty on purpose (the author will decide later what to pre-fill).
 */
type Fields = {
  nickname: string;
  email: string;
  address: string;
  phone: string;
  linkedin: string;
  info: string;
};

const EMPTY: Fields = { nickname: '', email: '', address: '', phone: '', linkedin: '', info: '' };

export default function Profile() {
  const { user, setUser } = useCurrentUser();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const fileInput = useRef<HTMLInputElement>(null);

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinFormOpen, setPinFormOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const update = (key: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields({ ...fields, [key]: e.target.value });

  function onPictureChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Session only: the object URL is lost on reload, then the default photo comes back.
    setUser({ ...user, photoUrl: URL.createObjectURL(file), photoHasRing: false });
    e.target.value = '';
  }

  function savePin(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(newPin)) {
      setPinMessage({ text: 'The PIN must be 4 to 6 digits.', ok: false });
    } else if (newPin !== confirmPin) {
      setPinMessage({ text: 'The two PINs do not match.', ok: false });
    } else {
      setPin(newPin);
      setPinFormOpen(false);
      setPinMessage({ text: 'PIN updated (prototype only, not sent to DTU).', ok: true });
    }
    setNewPin('');
    setConfirmPin('');
  }

  const digitsOnly = (set: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) =>
    set(e.target.value.replace(/\D/g, '').slice(0, 6));

  return (
    <div className="sub-screen profile">
      <SubHeader title="Edit My User Profile" />

      <p className="profile__name">
        {user.name} ({user.studentId})
      </p>

      <div className="profile__top">
        <div className="profile__photo">
          {user.photoUrl ? (
            <img
              className={'profile__avatar' + (user.photoHasRing ? '' : ' profile__avatar--ring')}
              src={user.photoUrl}
              alt=""
            />
          ) : (
            <span className="profile__avatar profile__avatar--ring profile__avatar--initials">
              {initials(user.name)}
            </span>
          )}
          <button type="button" className="profile__button" onClick={() => fileInput.current?.click()}>
            Change Picture
          </button>
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPictureChosen} />
        </div>
        <Field label="nickname" value={fields.nickname} onChange={update('nickname')} />
      </div>

      <Field label="email" type="email" value={fields.email} onChange={update('email')} />
      <Field label="home address" value={fields.address} onChange={update('address')} />
      <Field label="phone number" type="tel" value={fields.phone} onChange={update('phone')} />
      <Field label="linkedIn" value={fields.linkedin} onChange={update('linkedin')} />

      <label className="profile__field profile__field--wide">
        <span className="profile__label">personal information</span>
        <textarea className="profile__input profile__textarea" value={fields.info} onChange={update('info')} />
      </label>

      <div className="profile__pin-row">
        <label className="profile__field">
          <span className="profile__label">ID card PIN</span>
          <span className="profile__pin-box">
            <input
              className="profile__input"
              type={showPin ? 'text' : 'password'}
              value={pin}
              readOnly
              placeholder="Not set"
            />
            <button
              type="button"
              className="profile__eye"
              onClick={() => setShowPin(!showPin)}
              aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              aria-pressed={showPin}
            >
              <img src="/icons/eye-hide.svg" width={24} height={24} alt="" />
            </button>
          </span>
        </label>
        <button
          type="button"
          className="profile__button"
          onClick={() => {
            setPinFormOpen(!pinFormOpen);
            setPinMessage(null);
          }}
        >
          Change PIN
        </button>
      </div>

      {pinFormOpen && (
        <form className="profile__pin-form" onSubmit={savePin}>
          <Field label="new PIN" type="password" inputMode="numeric" value={newPin} onChange={digitsOnly(setNewPin)} />
          <Field
            label="confirm new PIN"
            type="password"
            inputMode="numeric"
            value={confirmPin}
            onChange={digitsOnly(setConfirmPin)}
          />
          <div className="profile__pin-actions">
            <button type="submit" className="profile__button">
              Save
            </button>
            <button type="button" className="profile__button" onClick={() => setPinFormOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {pinMessage && (
        <p className={'profile__message' + (pinMessage.ok ? '' : ' profile__message--error')} role="status">
          {pinMessage.text}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  inputMode?: 'numeric';
}) {
  return (
    <label className="profile__field">
      <span className="profile__label">{label}</span>
      <input className="profile__input" type={type} inputMode={inputMode} value={value} onChange={onChange} />
    </label>
  );
}
