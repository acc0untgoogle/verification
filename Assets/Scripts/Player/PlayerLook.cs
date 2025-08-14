using UnityEngine;

public class PlayerLook : MonoBehaviour {
    public Transform cam; public float sensX=100f, sensY=100f; float xRot, yRot;
    public float aimFov = 55f; public float hipFov = 75f; public float aimLerp = 10f; Camera c;

    void Awake(){ c = cam.GetComponent<Camera>(); Cursor.lockState = CursorLockMode.Locked; }

    public void Tick(Vector2 mouse, bool aiming){
        yRot += mouse.x * sensX * 0.01f; xRot -= mouse.y * sensY * 0.01f; xRot = Mathf.Clamp(xRot, -80, 80);
        transform.rotation = Quaternion.Euler(0, yRot, 0);
        cam.localRotation = Quaternion.Euler(xRot, 0, 0);
        c.fieldOfView = Mathf.Lerp(c.fieldOfView, aiming? aimFov: hipFov, Time.deltaTime*aimLerp);
    }
}
