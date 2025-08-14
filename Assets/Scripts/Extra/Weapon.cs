using UnityEngine;

public enum WeaponType { Pistol, Rifle, Sniper, Shotgun, SMG, Grenade }

public class Weapon : MonoBehaviour {
    [Header("General Settings")]
    public string weaponName = "New Weapon";
    public WeaponType weaponType;
    public GameObject weaponModel;

    [Header("Stats")]
    public float damage = 25f;
    public float range = 100f;
    public float fireRate = 0.2f;
    public int ammoInMag = 30;
    public int magSize = 30;
    public int reserveAmmo = 90;
    public float reloadTime = 1.5f;

    [Header("Recoil Settings")]
    public float recoilAmount = 0.5f;

    [Header("Grenade Settings (if grenade)")]
    public float explosionRadius = 5f;
    public float explosionForce = 500f;
    public GameObject explosionEffect;

    private bool isReloading = false;
    public bool IsReloading => isReloading;

    public void Reload(){
        if (isReloading || ammoInMag == magSize || reserveAmmo <= 0) return;
        isReloading = true;
        var mb = GetComponent<MonoBehaviour>();
        if (mb != null) mb.StartCoroutine(ReloadCoroutine());
    }

    private System.Collections.IEnumerator ReloadCoroutine(){
        yield return new WaitForSeconds(reloadTime);
        int neededAmmo = magSize - ammoInMag;
        int ammoToReload = Mathf.Min(neededAmmo, reserveAmmo);
        ammoInMag += ammoToReload;
        reserveAmmo -= ammoToReload;
        isReloading = false;
    }
}
