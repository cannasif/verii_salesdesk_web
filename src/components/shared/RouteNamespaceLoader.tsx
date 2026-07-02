import { type ReactElement, type ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ensureNamespacesReady } from '@/lib/i18n';
import { getNamespacesForPath } from '@/lib/route-namespaces';
import { PageLoader } from './PageLoader';

interface RouteNamespaceLoaderProps {
  children: ReactNode;
}

const loadedRouteKeys = new Set<string>();

function buildRouteKey(pathname: string, namespaces: readonly string[]): string {
  return `${pathname}::${namespaces.join('|')}`;
}

export function RouteNamespaceLoader({ children }: RouteNamespaceLoaderProps): ReactElement {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [loadedPath, setLoadedPath] = useState<string | null>(null);

  const namespaces = useMemo(
    () => getNamespacesForPath(location.pathname),
    [location.pathname]
  );

  const routeKey = useMemo(
    () => buildRouteKey(location.pathname, namespaces),
    [location.pathname, namespaces]
  );

  useEffect(() => {
    let cancelled = false;

    if (loadedRouteKeys.has(routeKey)) {
      setLoadedPath(location.pathname);
      setReady(true);
      return () => {
        cancelled = true;
      };
    }

    setReady(false);

    async function load(): Promise<void> {
      await ensureNamespacesReady(namespaces);
      if (cancelled) return;
      loadedRouteKeys.add(routeKey);
      setLoadedPath(location.pathname);
      setReady(true);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, namespaces, routeKey]);

  if (!ready || loadedPath !== location.pathname) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
