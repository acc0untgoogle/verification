using UnityEngine;

public abstract class WeaponBase : MonoBehaviour
{
    [Header("Weapon Settings")]
    public string weaponName;
    public int maxAmmo;
    public int currentAmmo;
    public int damage;
    public float fireRate;
    public float reloadTime;
    public float range = 100f;
    public Vector3 recoilPattern = new Vector3(0.1f, 0.2f, 0.05f);
    
    [Header("References")]
    public Transform muzzle;
    public ParticleSystem muzzleFlash;
    public GameObject impactEffect;
    public AudioClip shootSound;
    public AudioClip reloadSound;
    
    protected float nextTimeToFire;
    protected bool isReloading;
    
    public abstract void Shoot();
    public abstract void Reload();
    public abstract void ApplyRecoil();
    
    protected void PlayMuzzleFlash()
    {
        if (muzzleFlash != null)
        {
            muzzleFlash.Play();
        }
    }
    
    protected void PlayShootSound()
    {
        if (shootSound != null)
        {
            AudioSource.PlayClipAtPoint(shootSound, muzzle.position);
        }
    }
    
    protected void CreateImpactEffect(Vector3 hitPoint, Vector3 normal)
    {
        if (impactEffect != null)
        {
            GameObject effect = Instantiate(impactEffect, hitPoint, Quaternion.LookRotation(normal));
            Destroy(effect, 2f);
        }
    }
}
