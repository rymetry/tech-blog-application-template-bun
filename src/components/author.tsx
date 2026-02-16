import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Author as AuthorType } from '@/types';

interface AuthorProps {
  author: AuthorType;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  compact?: boolean;
}

export function Author({ author, size = 'md', showName = true, compact = false }: AuthorProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };
  const nameClasses = compact
    ? 'text-xs sm:text-xs md:text-xs font-medium'
    : 'text-sm sm:text-sm md:text-base font-medium';

  // 著者名が存在しない場合
  const authorName = author.name || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2" aria-label={`Author: ${authorName}`}>
      <Avatar className={sizeClasses[size]}>
        {author.image?.url ? <AvatarImage src={author.image.url} alt="" loading="lazy" /> : null}
        <AvatarFallback>{authorInitial}</AvatarFallback>
      </Avatar>
      {showName && <span className={nameClasses}>{authorName}</span>}
    </div>
  );
}
