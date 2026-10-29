import { afterEach,vi } from 'vitest';
import { cleanup } from '@testing-library/react';
afterEach(()=>{cleanup();vi.restoreAllMocks();sessionStorage.clear();});
class Observer { observe(){} unobserve(){} disconnect(){} }
vi.stubGlobal('ResizeObserver',Observer);
Element.prototype.scrollIntoView=()=>undefined;
Object.defineProperty(window,'matchMedia',{value:()=>({matches:false,addListener:()=>undefined,removeListener:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,dispatchEvent:()=>false})});
