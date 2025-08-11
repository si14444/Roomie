import { useRouter } from 'expo-router';
import TeamSelectionScreen from '@/components/team/TeamSelectionScreen';

export default function TeamSelectionRoute() {
  const router = useRouter();

  const handleTeamSelected = () => {
    router.replace('/(tabs)');
  };

  return <TeamSelectionScreen onTeamSelected={handleTeamSelected} />;
}