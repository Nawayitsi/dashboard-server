import { PageTransition } from '../components/common/PageTransition';
import { TopologyView } from '../components/integrations/TopologyView';

export function Infrastructure() {
  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Infrastructure Overview</h1>
        <p className="text-xs text-gray-400 mt-1">Full network infrastructure design and hardware layout mapping.</p>
      </div>

      <TopologyView />
    </PageTransition>
  );
}
