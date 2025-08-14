using UnityEngine;

public abstract class WeaponBase : MonoBehaviour {
    [Header("Stats")] public float damage = 20f; public float range = 120f; public int magSize = 30; public int ammoInMag = 30; public float fireRate = 0.1f; public float reloadTime=1.6f;
    [Header("FX")] public Transform muzzle; public ParticleSystem muzzleFx; public ObjectPool impactPool; public Recoil recoil;

    protected float nextFire; protected bool reloading; protected bool aiming;

    public virtual void Tick(bool fire, bool reload, bool aim){
        aiming = aim;
        if(reload && ammoInMag<magSize && !reloading) StartCoroutine(Reload());
        if(fire && Time.time>=nextFire && !reloading){ Fire(); }
    }

    protected abstract void Fire();

    protected System.Collections.IEnumerator Reload(){
        reloading = true; yield return new WaitForSeconds(reloadTime); ammoInMag = magSize; reloading = false;
    }
}
