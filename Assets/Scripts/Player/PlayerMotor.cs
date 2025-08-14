using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerMotor : MonoBehaviour {
    [Header("Speed")]
    public float walk = 4f; public float run = 7.5f; public float crouch = 2.5f; public float slide = 10f;
    [Header("Jump/Gravity")]
    public float jumpForce = 5f; public float gravity = -18f;

    CharacterController cc; Vector3 vel; bool grounded; bool isCrouch; bool isSliding; float slideTimer;

    void Awake(){ cc = GetComponent<CharacterController>(); }

    public void Tick(Vector2 input, bool runKey, bool jumpKey, bool crouchKey){
        grounded = cc.isGrounded;
        if(grounded && vel.y<0) vel.y = -2f;

        if(crouchKey){
            if(!isCrouch){ isCrouch = true; cc.height = 1.2f; }
        } else if(!isSliding){
            if(isCrouch){ isCrouch = false; cc.height = 1.8f; }
        }

        float speed = isSliding? slide : isCrouch? crouch : (runKey? run : walk);
        Vector3 move = transform.right * input.x + transform.forward * input.y;
        cc.Move(move * speed * Time.deltaTime);

        if(jumpKey && grounded && !isCrouch){ vel.y = Mathf.Sqrt(jumpForce * -2f * gravity); }

        if(runKey && crouchKey && grounded && !isSliding){ isSliding = true; slideTimer = 0.6f; }
        if(isSliding){ slideTimer -= Time.deltaTime; if(slideTimer<=0) isSliding = false; }

        vel.y += gravity * Time.deltaTime;
        cc.Move(vel * Time.deltaTime);
    }
}
