using UnityEngine;

public class Rifle : WeaponBase
{
    [Header("Rifle Settings")]
    public int bulletsPerShot = 1;
    public float spreadAngle = 1f;
    
    private void Start()
    {
        currentAmmo = maxAmmo;
    }
    
    public override void Shoot()
    {
        if (Time.time < nextTimeToFire || isReloading || currentAmmo <= 0)
            return;
            
        nextTimeToFire = Time.time + 1f / fireRate;
        currentAmmo--;
        
        PlayMuzzleFlash();
        PlayShootSound();
        ApplyRecoil();
        
        for (int i = 0; i < bulletsPerShot; i++)
        {
            Vector3 direction = muzzle.forward;
            direction = Quaternion.AngleAxis(Random.Range(-spreadAngle, spreadAngle), muzzle.up) * direction;
            direction = Quaternion.AngleAxis(Random.Range(-spreadAngle, spreadAngle), muzzle.right) * direction;
            
            RaycastHit hit;
            if (Physics.Raycast(muzzle.position, direction, out hit, range))
            {
                // Handle hit
                CreateImpactEffect(hit.point, hit.normal);
                
                if (hit.collider.CompareTag("Player"))
                {
                    hit.collider.GetComponent<PlayerHealth>().TakeDamage(damage);
                }
            }
        }
    }
    
    public override void Reload()
    {
        if (isReloading || currentAmmo == maxAmmo)
            return;
            
        isReloading = true;
        AudioSource.PlayClipAtPoint(reloadSound, transform.position);
        Invoke("FinishReload", reloadTime);
    }
    
    private void FinishReload()
    {
        currentAmmo = maxAmmo;
        isReloading = false;
    }
    
    public override void ApplyRecoil()
    {
        // Apply recoil to player camera or weapon model
        Vector3 recoil = new Vector3(
            Random.Range(-recoilPattern.x, recoilPattern.x),
            Random.Range(-recoilPattern.y, recoilPattern.y),
            Random.Range(-recoilPattern.z, recoilPattern.z)
        );
        
        transform.localPosition += recoil;
    }
}
