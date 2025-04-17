import { useAccountStore } from "@/store";
import type { Router } from "vue-router";

export default (router:Router)=>{
  router.beforeEach(async (to,_,next) => {
    if(!to.meta.auth){
      next();
      return;
    }
    const accountStore = useAccountStore();
    if (!accountStore.accessToken){
      next({
        name: 'dashboard-login',
        replace:true,
      });
      return;
    }
    next();
  })
}