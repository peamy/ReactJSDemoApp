import {useEffect, useState} from "react";

/**
 * A function that will perform a http request.
 */
type httpFunction<T> = () => Promise<T>;
/**
 * Optional - A callback function that will be executed if the httpFunction returns a success code.
 */
type onSuccess<T> = (result: T) => void;
/**
 * Optional - A callback function that will be executed if the httpFunction returns an error code. Executed before each retry.
 */
type onError = () => void;
/**
 * Optional - Determines if the result should be stored in the cache (default = sessionStorage, can be set to localStorage).
 */
type cache = {
  /**
   * Optional - If set to true, the result of the httpFunction will be stored in cache.
   */
  cacheResult?: boolean;
  /**
   * The key with which a cached result will be stored with, and taken from the cache.
   */
  cacheKey: string;
  /**
   * Optional - The amount of seconds after which the cache should become invalid. Starts counting from time of first request.
   * @Example "cacheExpireTime: 2000" means the cache is valid for 2000 seconds.
   */
  cacheExpireTime?: number;
  /**
   * If true, use localStorage, if false, use sessionStorage. Default = false;
   */
  useLocalStorage?: boolean;
}
/**
 * Optional - A type check that can be done on the result of the http request. If the type check fails, an error will be returned.
 */
type typeCheck = (obj: any) => boolean;

export interface IUseHttpHook<T> {
  /**
   * The result of the http request.
   */
  result: T | undefined;
  /**
   * If an error occurs during execution, it's stored in this variable. If there is no error, the value is undefined.
   */
  error: Error | undefined;
  /**
   * True during execution of the http request.
   */
  loading: boolean;
  /**
   * This function executes the httpRequest. The http request is also fired automatically when the hook loads.
   */
  executeHttpFunction: () => Promise<void>;
  /**
   * Removes data from the cache if it is present, using the passed cacheKey from the cache config.
   */
  invalidateCache: () => void;
}

/**
 *
 * @param httpFunction - A function that will perform a http request.
 * @param configuration: { onSuccess?: onSuccess<T>, onError?: onError, cache?: cache } - Optional - Extra configuration options.
 * @param dependencyArray - Optional - An array of variables that when changed, trigger the http function to be executed.
 */
export const useHttpHook = <T extends {}>(httpFunction: httpFunction<T>, configuration?: { onSuccess?: onSuccess<T>, onError?: onError, cache?: cache, typeCheck?: typeCheck }, dependencyArray?: any[]): IUseHttpHook<T> => {

  const [result, setResult] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    executeHttpFunction();
  }, dependencyArray ? dependencyArray : []);

  /**
   * Set three states to desired value.
   * @param resultState
   * @param error
   * @param loadingState
   */
  const setStates = (resultState: T | undefined, error: Error | undefined, loadingState: boolean) => {
    setResult(resultState);
    setError(error);
    setLoading(loadingState);
  }

  /**
   * Remove cached data for passed cacheKey.
   */
  const invalidateCache = () => {
    if (configuration && configuration.cache?.cacheKey) {
      getLocalOrSessionStorage().removeItem(configuration.cache.cacheKey);
    }
  }

  /**
   * Selects the desired storage option for the chosen configuration: Session or local.
   */
  const getLocalOrSessionStorage = (): Storage => {
    if (configuration && configuration.cache && configuration.cache.useLocalStorage) {
      return localStorage;
    }
    return sessionStorage;
  }

  /**
   * If caching is turned on, available and valid, attempts to get data from cache.
   */
  const getItemFromCache = (): T | null => {

    if (!configuration || !configuration.cache?.cacheKey || !configuration.cache.cacheResult) return null;

    const item = getLocalOrSessionStorage().getItem(configuration.cache.cacheKey);
    if (!item) return null;

    try {
      const parsedItem = JSON.parse(item) as {result: T, expires?: number};

      // If a typecheck function is passed, execute it.
      if (configuration.typeCheck && !configuration.typeCheck(parsedItem)) {
        invalidateCache();
        throw Error(`useHttpHook -> Data stored in cache for key ${configuration.cache.cacheKey} failed typecheck, re-fetching item.`)
      }

      // Check if there is an expiration date for the cache. If there is one, and it's passed, we clear the cache and execute the http request.
      if (parsedItem.expires && parsedItem.expires < Math.floor(Date.now() / 1000)) {
        invalidateCache();
        throw Error(`useHttpHook -> Cache expired for result with key ${configuration.cache.cacheKey}, re-fetching item.`);
      }

      if (configuration?.onSuccess) configuration.onSuccess(parsedItem.result);

      return parsedItem.result;
    }
    catch(e) {
      console.error(e);
      console.error(`useHttpHook -> Failed to retrieve or parse item from cache with key ${configuration.cache.cacheKey}, re-fetching item.`);
      return null;
    }
  }

  const executeHttpFunction = async (): Promise<void> => {

    setLoading(true);

    // If we are set to use the cache, and we have a passed key, attempt to fetch an item from the localstorage.
    // If the item is present return it.
    const item = getItemFromCache();
    if (item) {
      setStates(item, undefined, false);
      return;
    }

    // If the cache is expired, not requested or there is nothing in the cache we do the httpRequest.
    try {
      let result: T = await httpFunction();

      // If a typecheck function is passed, execute it.
      if (configuration?.typeCheck && !configuration.typeCheck(result)) {
        invalidateCache();
        throw Error(`useHttpHook -> Data fetched with http request for key ${configuration?.cache?.cacheKey} failed typecheck.`);
      }

      if (configuration?.onSuccess) {
        configuration.onSuccess(result);
      }

      if (configuration && configuration.cache?.cacheResult) {
        getLocalOrSessionStorage().setItem(configuration.cache.cacheKey, JSON.stringify({result, expires: configuration.cache.cacheExpireTime ? Math.floor(Date.now() / 1000) + configuration.cache.cacheExpireTime : undefined}));
      }

      setStates(result, undefined, false);
    }
    catch(e) {
      if (configuration && configuration.onError) {
        configuration.onError();
      }

      setStates(undefined, e as Error, false);
    }
  }

  return {result, error, loading, executeHttpFunction, invalidateCache};
}