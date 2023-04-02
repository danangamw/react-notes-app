import { AES, enc } from 'crypto-js';
import { v4 as uuid } from 'uuid';
import { ChangeEvent, FormEvent, useState } from 'react';
import styles from './LoginPage.module.css';
import storage from './storage';
import { UserData } from './types';

const PASSPHRASE_STORAGE_KEY = 'passphrase';

type Props = {
  setUserData: (userData: UserData) => void;
};

const LoginPage = ({ setUserData }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const encryptedPassphrase = storage.get<string | undefined>(
      `${username}:${PASSPHRASE_STORAGE_KEY}`
    );

    if (!encryptedPassphrase) {
      const passphrase = uuid();
      storage.set(
        `${username}:${PASSPHRASE_STORAGE_KEY}`,
        AES.encrypt(passphrase, password).toString()
      );
      setUserData({ username, passphrase });
      return;
    }

    const passphrase = AES.decrypt(encryptedPassphrase, password).toString(
      enc.Utf8
    );

    if (passphrase) {
      setUserData({ username, passphrase });
    } else {
      setErrorText('Invalid credentials for existing user');
    }
  };

  const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className={styles.pageContainer}>
      <form className={styles.loginContainer} onSubmit={handleSubmit}>
        {errorText}
        <label>
          <div className={styles.labelText}>Username</div>
          <input
            name="username"
            type="text"
            className={styles.textField}
            value={username}
            onChange={handleChangeUsername}
          />
        </label>

        <label>
          <div className={styles.labelText}>Password</div>
          <input
            name="password"
            type="password"
            className={styles.textField}
            value={password}
            onChange={handleChangePassword}
          />
        </label>

        <div>
          <button type="submit" className={styles.button}>
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
