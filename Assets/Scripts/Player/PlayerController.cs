using UnityEngine;

[RequireComponent(typeof(PlayerMotor))]
public class PlayerController : MonoBehaviour {
    public PlayerMotor motor; public PlayerLook look; public WeaponBase weapon;

    void Update(){
        Vector2 move = new(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"));
        Vector2 mouse = new(Input.GetAxis("Mouse X"), Input.GetAxis("Mouse Y"));
        bool run = Input.GetKey(KeyCode.LeftShift);
        bool jump = Input.GetKeyDown(KeyCode.Space);
        bool crouch = Input.GetKey(KeyCode.LeftControl);
        bool aim = Input.GetMouseButton(1);
        bool fire = Input.GetMouseButton(0);
        bool reload = Input.GetKeyDown(KeyCode.R);
        bool throwGren = Input.GetKeyDown(KeyCode.G);

        motor.Tick(new Vector2(move.x, move.y), run, jump, crouch);
        look.Tick(mouse, aim);
        if(weapon){ weapon.Tick(fire, reload, aim); }
        if(throwGren) Grenade.ThrowFrom(transform.position + transform.forward*0.5f + Vector3.up, transform.forward + Vector3.up*0.2f);
    }
}
