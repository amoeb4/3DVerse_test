import numpy as np
import matplotlib.pyplot as plt
from pytransform3d.transformations import invert_transform, plot_transform
from pytransform3d.rotations import matrix_from_euler, euler_from_matrix

# --- Rotations souhaitées ---
theta = np.deg2rad([0, 30, 0, 0, 0, 0])  # en radians

# --- Coordonnées et angles Euler ---
poses = {
    "P01": ([-1120, 320, -46.5], [180, 0, -180]),
    "P02": ([-1120, 671, -46.5], [0, 90, 0]),
    "P03": ([-720, 870, 141], [180, 0, -180]),
    "P04": ([-720, 1940, -46.5], [180, 0, -180]),
    "P05": ([-527, 1940, -46.5], [-90, -90, 90]),
    "P06": ([505, 1940, -46.5], [-180, 0, -180]),
    "P07": ([505, 1940, -46.5], [-180, 0, -180]),
    "P08": ([680, 1940, -46.5], [-180, 0, -180]),
}

# --- Transformées homogènes dans le repère monde ---
T0i = [np.eye(4)]  # T0 (monde)
for _, (xyz, abc) in poses.items():
    R = matrix_from_euler(np.deg2rad(abc), 0, 1, 2, False)
    T = np.eye(4)
    T[:3, :3] = R
    T[:3, 3] = xyz
    T0i.append(T)
    T0i.append(T)


# --- Affichage 3D ---
def plot_transforms(T_list, labels, title):
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    for T, label in zip(T_list, labels):
        plot_transform(ax=ax, A2B=T, s=100, name=label)
    origins = np.array([T[:3, 3] for T in T_list])
    ax.plot(origins[:, 0], origins[:, 1], origins[:, 2], 'k')
    ax.view_init(elev=90, azim=0)
    ax.set_title(title)
    plt.tight_layout()
    plt.show()


labels = ["Monde"] + list(poses.keys())
plot_transforms([T0i[i] for i in range(0, len(T0i), 2)], labels, "Position de calibration")

# --- Transformées relatives Tij ---
Tij = [invert_transform(T0i[i]) @ T0i[i + 1] for i in range(len(T0i) - 1)]


def make_rotation(Tij, theta, t0i_index, axis):
    """
    Applique une rotation à la liaison entre T0i[t0i_index - 1] et T0i[t0i_index],
    puis reconstruit les T0i_new.

    Args:
        Tij (list): Liste des transformées relatives (entre chaque T0i consécutifs).
        theta (float): Angle en radians à appliquer.
        t0i_index (int): Index de T0i (comme en MATLAB : 2, 6, 8...).
        axis (str): 'x', 'y', ou 'z'.

    Returns:
        (Tij_updated, T0i_new)
    """

    if not (0 <= t0i_index < len(Tij)):
        raise IndexError(f"Index {t0i_index} invalide pour la liste Tij (taille {len(Tij)}).")

    R = np.eye(4)
    if axis == 'x':
        R[:3, :3] = matrix_from_euler([theta, 0, 0], 0, 1, 2, False)
    elif axis == 'y':
        R[:3, :3] = matrix_from_euler([0, theta, 0], 0, 1, 2, False)
    elif axis == 'z':
        R[:3, :3] = matrix_from_euler([0, 0, theta], 0, 1, 2, False)

    Tij[t0i_index] = R @ Tij[t0i_index]

    # Reconstruction des T0i
    T0i_new = [np.eye(4)]
    for Ti in Tij:
        T0i_new.append(T0i_new[-1] @ Ti)
    return Tij, T0i_new


# --- Application des rotations ---
Tij_new, T0i_new = make_rotation(Tij, theta[0], 1, "y")
Tij_new, T0i_new = make_rotation(Tij_new, theta[1], 5, "z")
Tij_new, T0i_new = make_rotation(Tij_new, theta[2], 7, "z")
Tij_new, T0i_new = make_rotation(Tij_new, theta[3], 9, "z")
Tij_new, T0i_new = make_rotation(Tij_new, theta[4], 11, "z")
Tij_new, T0i_new = make_rotation(Tij_new, theta[5], 13, "x")

# --- Affichage final ---
plot_transforms([T0i_new[i] for i in range(0, len(T0i_new), 2)], labels, "Nouvelle position")

# --- Affichage des positions finales ---
print("\n--- Résultats finaux ---")
for i in range(1, len(T0i_new), 2):
    pos = T0i_new[i][:3, 3]
    angles = np.rad2deg(euler_from_matrix(T0i_new[i][:3, :3], 2, 1, 0, False))
    print(f"--- P0{i} ---")
    print(f"x = {pos[0]:.3f}, y = {pos[1]:.3f}, z = {pos[2]:.3f}")
    print(f"A = {angles[2]:.3f}, B = {angles[1]:.3f}, C = {angles[0]:.3f}\n")
