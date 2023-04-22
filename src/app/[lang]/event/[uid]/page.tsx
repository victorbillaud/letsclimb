import { Flex, Text } from '@/components/common';
import { getEvent } from '@/features/events';
import { Locale } from '@/i18n';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: {
    lang: Locale;
    uid: string;
  };
};

export default async function Page({ params }: Props) {
  const supabase = createClient();

  const { event } = await getEvent({
    client: supabase,
    eventId: params.uid,
  });

  if (!event) {
    return null;
  }

  return (
    <Flex gap={1} className="mt-2">
      <Text variant="caption">Details</Text>
    </Flex>
  );
}
