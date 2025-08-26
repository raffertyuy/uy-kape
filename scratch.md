The guest module is currently gated by a password login screen.
Create a new configurable environment variable that can be used to bypass the password login requirement.

i.e.
- when the bypass = true, the password login screen is bypassed.
- when the bypass variable is false, or if the configuration is not present, the password login screen is required (just like how it behaves today).
