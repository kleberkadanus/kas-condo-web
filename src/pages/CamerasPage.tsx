import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
import { getCameras } from '../api/condos';
import { Camera, ExternalLink } from 'lucide-react';

export default function CamerasPage() {
  const { user } = useAuth();
  const { data: cameras = [], isLoading } = useQuery({
    queryKey: ['cameras', user?.condo_id],
    queryFn: () => getCameras(user!.condo_id!),
    enabled: !!user?.condo_id
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Carregando...</div>;

  if (cameras.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <Camera size={40} className="mx-auto mb-3 opacity-30" />
      <p>Nenhuma câmera cadastrada</p>
    </div>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cameras.map((cam: any) => (
        <div key={cam.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {cam.hls_url ? (
            <div className="bg-gray-900 aspect-video flex items-center justify-center relative">
              <video
                src={cam.hls_url}
                controls
                autoPlay
                muted
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Camera size={32} className="text-white opacity-20" />
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 aspect-video flex items-center justify-center">
              <Camera size={32} className="text-white opacity-30" />
            </div>
          )}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 text-sm">{cam.name}</p>
              <p className="text-xs text-gray-400">{cam.location}</p>
            </div>
            {cam.hls_url && (
              <a href={cam.hls_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600">
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
