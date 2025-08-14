using UnityEngine;
using UnityEngine.UI;

public class AmmoUI : MonoBehaviour {
    public Text text; public WeaponBase weapon;
    void Update(){ if(weapon && text) text.text = $"{weapon.ammoInMag}/{weapon.magSize}"; }
}
