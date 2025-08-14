using UnityEngine;

[RequireComponent(typeof(Camera))]
public class PlayerShooting : MonoBehaviour {
    public Camera fpsCam;
    public ParticleSystem muzzleFlash;
    public GameObject impactEffect;
    public Transform shootPoint;
    public Weapon currentWeapon;
    public Recoil recoil;

    private float nextTimeToFire = 0f;

    void Awake(){ if(!fpsCam) fpsCam = GetComponent<Camera>(); }

    void Update(){
        bool fire = Input.GetButton("Fire1");
        bool reload = Input.GetKeyDown(KeyCode.R);

        if (reload && currentWeapon != null) currentWeapon.Reload();

        if (currentWeapon != null && fire && Time.time >= nextTimeToFire && !currentWeapon.IsReloading){
            if (currentWeapon.ammoInMag > 0){
                nextTimeToFire = Time.time + currentWeapon.fireRate;
                Shoot();
            } else {
                currentWeapon.Reload();
            }
        }
    }

    void Shoot(){
        currentWeapon.ammoInMag--;
        if(muzzleFlash) muzzleFlash.Play();
        if(recoil) recoil.Kick(true);

        Ray ray = new Ray(fpsCam.transform.position, fpsCam.transform.forward);
        if(Physics.Raycast(ray, out RaycastHit hit, currentWeapon.range)){
            if(hit.collider.TryGetComponent<IDamageable>(out var target)){
                target.TakeDamage(currentWeapon.damage, gameObject);
            }
            if(impactEffect) Instantiate(impactEffect, hit.point, Quaternion.LookRotation(hit.normal));
        }
    }
}
