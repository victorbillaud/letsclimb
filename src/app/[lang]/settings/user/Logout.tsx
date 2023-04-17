'use client';

import { useSupabase } from '@/components/auth/SupabaseProvider';
import { Button, Flex } from '@/components/common';
import { useTheme } from 'next-themes';

export const Logout = () => {
  const { signOut } = useSupabase();
  const { resolvedTheme, setTheme } = useTheme();

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.log({ error });
    }
  };

  return (
    <Flex>
      <Button
        text="Toggle Theme"
        variant={resolvedTheme === 'dark' ? 'primary' : 'secondary'}
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      />
      <Button
        text="System Theme"
        variant={resolvedTheme === 'system' ? 'primary' : 'secondary'}
        onClick={() => setTheme('system')}
      />
      <Button text="Logout" variant="alert" onClick={handleLogout} />
    </Flex>
  );
};
