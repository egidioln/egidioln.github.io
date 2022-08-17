m = 0.005; % kg
M = 0.05; % kg
g = 100; %m/s2
L = 20; %m
d = 0.01; %Ns/m
k = 1.3; %Ns/rad
I = m*L^2/12;

Delta = @(th) (I+m*L^2)*(m+M) - (m*L*cos(th))^2;
Mcal = @(th) [m+M           -m*L*cos(th);
            -m*L*cos(th)    I+m*L^2];
        
%F = @(th) m*g*L*sin(th) 

 %x dx th dth
aux = Mcal(0)*[0  0   m*g*L -k;
               0  -d    0    0]*(1/Delta(0));
A = [[0  1   0   0],
         aux(2,:),
     [0  0   0   1],
         aux(1,:)];
     
aux = Mcal(0)*[0;10]*(1/Delta(0));
B = [0;aux(2);0;aux(1)];
    