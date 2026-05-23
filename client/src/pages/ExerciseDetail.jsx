import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getExerciseById, searchYouTubeVideos } from '../services/exerciseApi';
import { ArrowLeft, Dumbbell, Target, Layers, Zap, PlayCircle, Loader2 } from 'lucide-react';

function MuscleTag({ label, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <span className={`capitalize text-xs font-medium px-2.5 py-1 rounded-full ${colors[color]}`}>
      {label}
    </span>
  );
}

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: exercise, isLoading, error } = useQuery({
    queryKey: ['exercise', id],
    queryFn: () => getExerciseById(id),
    staleTime: 1000 * 60 * 30,
  });

  const { data: videos } = useQuery({
    queryKey: ['exercise-videos', exercise?.name],
    queryFn: () => searchYouTubeVideos(`${exercise.name} exercise tutorial`),
    enabled: !!exercise?.name,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-brand-600" size={36} />
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="max-w-xl mx-auto mt-16 card text-center py-14">
        <Dumbbell size={44} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Exercise not found</h2>
        <p className="text-gray-400 text-sm mb-6">This exercise could not be loaded from the database.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* GIF */}
        <div className="card flex items-center justify-center bg-gray-50 min-h-64 p-4">
          {exercise.gifUrl ? (
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              className="max-h-72 w-auto rounded-xl object-contain"
            />
          ) : (
            <Dumbbell size={64} className="text-gray-200" />
          )}
        </div>

        {/* Info */}
        <div className="card flex flex-col justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 capitalize mb-4">{exercise.name}</h1>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Target size={16} className="text-brand-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Primary Target</div>
                  <MuscleTag label={exercise.target} color="green" />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Layers size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Body Part</div>
                  <MuscleTag label={exercise.bodyPart} color="blue" />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                  <Dumbbell size={16} className="text-yellow-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Equipment</div>
                  <MuscleTag label={exercise.equipment} color="yellow" />
                </div>
              </div>

              {exercise.secondaryMuscles?.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Zap size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">Secondary Muscles</div>
                    <div className="flex flex-wrap gap-1.5">
                      {exercise.secondaryMuscles.map(m => (
                        <MuscleTag key={m} label={m} color="purple" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-step instructions */}
      {exercise.instructions?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
              <Target size={14} className="text-brand-600" />
            </span>
            Step-by-Step Instructions
          </h2>
          <ol className="space-y-3">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-4 text-sm">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                  {i + 1}
                </span>
                <p className="text-gray-600 leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* YouTube videos */}
      {videos?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PlayCircle size={18} className="text-red-500" />
            Tutorial Videos
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {videos.map((item, i) => {
              const v = item.video;
              const videoId = v?.videoId;
              if (!videoId) return null;
              return (
                <a
                  key={i}
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl overflow-hidden border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all"
                >
                  <div className="relative">
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                      alt={v.title}
                      className="w-full h-28 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <PlayCircle size={36} className="text-white opacity-90" />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-snug">{v.title}</p>
                    {v.channelName && <p className="text-xs text-gray-400 mt-0.5">{v.channelName}</p>}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
