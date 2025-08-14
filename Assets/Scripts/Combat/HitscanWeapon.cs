using UnityEngine;

public class HitscanWeapon : WeaponBase {
    [Header("Spread/Recoil")] public float hipSpread=0.02f; public float aimSpread=0.005f;

    public LayerMask hitMask;

    protected override void Fire(){
        if(ammoInMag<=0) return; ammoInMag--; nextFire = Time.time + fireRate;
        muzzleFx?.Play(); recoil?.Kick(aiming);

        Vector3 dir = muzzle.forward + Random.insideUnitSphere * (aiming? aimSpread: hipSpread);
        if(Physics.Raycast(muzzle.position, dir.normalized, out RaycastHit hit, range, hitMask)){
            if(hit.collider.TryGetComponent<IDamageable>(out var dmg)) dmg.TakeDamage(damage, gameObject);
            if(impactPool){ var go = impactPool.Get(hit.point, Quaternion.LookRotation(hit.normal)); /* Return via FX script */ }
        }
    }
}
