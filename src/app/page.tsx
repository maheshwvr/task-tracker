import AuthGate from '@/components/AuthGate';
import TaskApp from '@/components/TaskApp';

export default function Page() {
  return (
    <AuthGate>
      <TaskApp />
    </AuthGate>
  );
}
