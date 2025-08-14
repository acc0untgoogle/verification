using UnityEngine;

public class Grenade_Smoke : Grenade {
    public GameObject smokeFx;
    protected override void Explode(){ if(smokeFx) Instantiate(smokeFx, transform.position, Quaternion.identity); }
}
