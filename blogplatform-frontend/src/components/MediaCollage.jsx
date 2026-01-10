import { useMemo } from 'react';
import MediaPlayer from '@/components/MediaPlayer';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const getLayoutConfig = (count, isMobile) => {
  if (isMobile) {
    if (count === 1) {
      return {
        grid: 'grid-cols-1',
        containerAspect: 'aspect-[4/5]',
        tiles: {}
      };
    }

    if (count === 2) {
      return {
        grid: 'grid-cols-2',
        containerAspect: 'aspect-[1/1]',
        tiles: {}
      };
    }

    if (count === 3) {
      return {
        grid: 'grid-cols-2 grid-rows-2',
        containerAspect: 'aspect-[4/3]',
        tiles: {
          0: 'col-span-2'
        }
      };
    }

    return {
      grid: 'grid-cols-2 auto-rows-fr',
      containerAspect: 'aspect-[4/3]',
      tiles: {}
    };
  }

  if (count === 1) {
    return {
      grid: 'grid-cols-1',
      containerAspect: 'aspect-[16/9]',
      tiles: {}
    };
  }

  if (count === 2) {
    return {
      grid: 'grid-cols-2',
      containerAspect: 'aspect-[4/3]',
      tiles: {}
    };
  }

  if (count === 3) {
    return {
      grid: 'grid-cols-[2fr_1fr] grid-rows-2',
      containerAspect: 'aspect-[4/3]',
      tiles: {
        0: 'row-span-2'
      }
    };
  }

  if (count === 4) {
    return {
      grid: 'grid-cols-2 grid-rows-2',
      containerAspect: 'aspect-[4/3]',
      tiles: {}
    };
  }

  if (count === 5) {
    return {
      grid: 'grid-cols-6 grid-rows-2',
      containerAspect: 'aspect-[4/3]',
      tiles: {
        0: 'col-span-4',
        1: 'col-span-2',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-3'
      }
    };
  }

  if (count === 6) {
    return {
      grid: 'grid-cols-3 grid-rows-2',
      containerAspect: 'aspect-[4/3]',
      tiles: {}
    };
  }

  return {
    grid: 'grid-cols-3 auto-rows-fr',
    containerAspect: 'aspect-[4/3]',
    tiles: {}
  };
};

export default function MediaCollage({ items, onOpen }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const maxVisible = isMobile ? 6 : 9;
  const visibleItems = useMemo(() => items.slice(0, maxVisible), [items, maxVisible]);
  const hiddenCount = items.length - visibleItems.length;
  const displayCount = visibleItems.length;

  const layout = useMemo(
    () => getLayoutConfig(displayCount, isMobile),
    [displayCount, isMobile]
  );

  return (
    <div
      className={`grid w-full gap-2 rounded-2xl overflow-hidden ${layout.grid} ${layout.containerAspect} max-h-[360px] sm:max-h-[420px] lg:max-h-[520px]`}
    >
      {visibleItems.map((item, idx) => {
        const tileSpan = layout.tiles?.[idx] || '';
        const showOverlay = hiddenCount > 0 && idx === visibleItems.length - 1;

        return (
          <button
            key={item.id || item.url || idx}
            type="button"
            className={`relative overflow-hidden rounded-2xl bg-base-200 ${tileSpan}`}
            onClick={() => onOpen(idx)}
          >
            <MediaPlayer media={item} type={item.type} url={item.url} className="h-full w-full object-cover" />
            {showOverlay && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral/70 text-white text-2xl font-semibold">
                +{hiddenCount}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
