import graph
import random
import math
import logging

def P(prev_score, next_score, temperature):
    if next_score > prev_score:
        return 1.0
    else:
        return math.exp( -abs(next_score-prev_score)/temperature )

class ObjectiveFunction:
    '''class to wrap an objective function and
    keep track of the best solution evaluated'''
    def __init__(self,objective_function):
        self.objective_function = objective_function
        self.best = None
        self.best_score = None

    def __call__(self, solution):
        score = self.objective_function(solution)
        if self.best is None or score > self.best_score:
            self.best_score = score
            self.best = solution
            logging.info('new best score: %f',self.best_score)
        return score

def kirkpatrick_cooling(start_temp, alpha):
    T = start_temp
    while True:
        yield T
        T = alpha*T
kirk = kirkpatrick_cooling(10, 0.9500)

logging.info(kirk)
