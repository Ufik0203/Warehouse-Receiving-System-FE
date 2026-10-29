import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { PropsWithChildren } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, resetHttp, setAuthLost } from '../../../config/http-client';
import { keys } from '../../../config/query-keys';
import { authApi } from '../api';
import type { User } from '../types';

function useSession() {
  const client = useQueryClient(); const [user,setUser] = useState<User | null | undefined>(undefined);
  const changeUser = useCallback((next: User | null, token?: string) => {
    resetHttp(token); void client.cancelQueries(); client.clear(); setUser(next);
    if (next) client.setQueryData(keys.auth(), next);
  },[client]);
  useEffect(() => setAuthLost(() => changeUser(null)),[changeUser]);
  const me = useQuery({ queryKey:keys.auth(), enabled:user !== null, retry:false, queryFn:async ({signal}) => {
    try { return (await authApi.me(signal)).data; }
    catch (error:unknown) { if(error instanceof ApiError && error.status===401) return null; throw error; }
  } });
  useEffect(() => {
    if(me.data === undefined)return;
    if((me.data === null&&user)||(me.data&&user&&me.data.id!==user.id))changeUser(me.data);
    else setUser(me.data);
  },[me.data,user,changeUser]);
  const login = useMutation({ mutationFn:authApi.login, retry:false, onSuccess:result => changeUser(result.data.user,result.data.csrfToken) });
  const logout = useMutation({ mutationFn:authApi.logout, retry:false, onSuccess:() => changeUser(null) });
  return { user, login, logout, restoring:user===undefined, error:me.error, retry:me.refetch };
}
type Session = ReturnType<typeof useSession>;
const AuthContext = createContext<Session | null>(null);
export function AuthProvider({children}:PropsWithChildren) { const value=useSession();return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; }
export function useAuth() { const value=useContext(AuthContext);if(!value) throw new Error('AuthProvider required.');return value; }
