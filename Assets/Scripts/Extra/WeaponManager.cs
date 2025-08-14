using UnityEngine;

public class WeaponManager : MonoBehaviour {
    public Weapon[] weapons;
    int index;

    void Start(){ Equip(0); }

    void Update(){
        for(int i=0;i<weapons.Length && i<9;i++){
            if(Input.GetKeyDown(KeyCode.Alpha1 + i)) Equip(i);
        }
        float scroll = Input.GetAxis("Mouse ScrollWheel");
        if(scroll > 0f) Equip((index + 1) % weapons.Length);
        else if(scroll < 0f) Equip((index - 1 + weapons.Length) % weapons.Length);
    }

    public void Equip(int i){
        if(weapons==null || weapons.Length==0) return;
        index = Mathf.Clamp(i, 0, weapons.Length-1);
        for(int k=0;k<weapons.Length;k++){
            bool active = (k==index);
            if(weapons[k]) weapons[k].gameObject.SetActive(active);
        }
    }

    public Weapon GetCurrentWeapon(){ return (weapons!=null && weapons.Length>0)? weapons[index] : null; }
}
