interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full h-3 rounded-xl bg-zinc-700 mt-4 overflow-hidden">
      <div 
        role="progressbar"
        aria-label="Progresso de hábitos completados nesse dia"
        aria-valuenow={75}
        className="h-full rounded-lg bg-violet-600 transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}