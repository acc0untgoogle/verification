using UnityEngine;

public class Recoil : MonoBehaviour {
    public Transform cam; public float hipKick=0.2f, aimKick=0.08f; public float returnSpeed=12f;
    Vector3 offset; 
    void Update(){ cam.localPosition = Vector3.Lerp(cam.localPosition, offset, Time.deltaTime*returnSpeed); offset = Vector3.Lerp(offset, Vector3.zero, Time.deltaTime*returnSpeed*0.5f); }
    public void Kick(bool aiming){ var a = aiming? aimKick: hipKick; offset -= new Vector3(0,0,a); }
}
